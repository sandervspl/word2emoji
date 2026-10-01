import { env, waitUntil } from 'cloudflare:workers';

const ERROR_THRESHOLD = 2;
const MAX_DETAIL_LENGTH = 500;
const PROJECT_NAME = 'word2emoji';
const STATUS_ENDPOINT = 'https://discord-bot-projects-status.sandervispoel.workers.dev/';

type ErrorOccurrence = {
  notification_attempted_at: string | null;
  occurrence_count: number;
};

function sanitizeForDiscord(value: string) {
  return value
    .replace(/@/g, '@\u200B')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatErrorDetail(detail: unknown) {
  if (detail instanceof Error) {
    return `${detail.name}: ${detail.message}`;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (detail === undefined) {
    return '';
  }

  try {
    return JSON.stringify(detail) ?? String(detail);
  } catch {
    return String(detail);
  }
}

function getStatusMessage(source: string, day: string, occurrence: ErrorOccurrence, detail: string) {
  const prefix = `${source} occurred ${occurrence.occurrence_count} times on ${day}.`;

  return detail ? `${prefix} Latest: ${detail}` : prefix;
}

async function sendErrorStatus(message: string) {
  const url = new URL(STATUS_ENDPOINT);
  url.searchParams.set('project-name', PROJECT_NAME);
  url.searchParams.set('status', 'error');
  url.searchParams.set('message', message);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Status endpoint returned ${response.status}`);
  }
}

async function recordErrorOccurrence(source: string, detail: string) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();

  const occurrence = await env.DB.prepare(
    `INSERT INTO error_occurrences (
      error_key,
      day,
      occurrence_count,
      last_message,
      updated_at
    ) VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(error_key, day) DO UPDATE SET
      occurrence_count = error_occurrences.occurrence_count + 1,
      last_message = excluded.last_message,
      updated_at = excluded.updated_at
    RETURNING occurrence_count, notification_attempted_at`,
  )
    .bind(source, day, detail, timestamp)
    .first<ErrorOccurrence>();

  if (
    !occurrence ||
    occurrence.occurrence_count < ERROR_THRESHOLD ||
    occurrence.notification_attempted_at !== null
  ) {
    return;
  }

  // Claim the single daily delivery attempt before the network call. Retaining this
  // claim after ambiguous failures prevents duplicate Discord notifications.
  const claim = await env.DB.prepare(
    `UPDATE error_occurrences
    SET notification_attempted_at = ?
    WHERE error_key = ?
      AND day = ?
      AND notification_attempted_at IS NULL
      AND occurrence_count >= ?
    RETURNING occurrence_count, notification_attempted_at`,
  )
    .bind(timestamp, source, day, ERROR_THRESHOLD)
    .first<ErrorOccurrence>();

  if (!claim) {
    return;
  }

  await sendErrorStatus(getStatusMessage(source, day, claim, detail));
}

export function reportOperationalError(source: string, message: string, detail?: unknown) {
  if (detail === undefined) {
    console.error(message);
  } else {
    console.error(message, detail);
  }

  const formattedDetail = formatErrorDetail(detail);
  const monitoringDetail = sanitizeForDiscord(
    `${message}${formattedDetail ? ` ${formattedDetail}` : ''}`,
  ).slice(0, MAX_DETAIL_LENGTH);

  waitUntil(
    recordErrorOccurrence(source, monitoringDetail).catch((error) => {
      console.error('Failed to record or report operational error:', error);
    }),
  );
}
