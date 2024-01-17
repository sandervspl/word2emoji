export const SizeIndicator = () => {
  return (
    <div className="text-secondary fixed bottom-4 left-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-black p-3 text-sm font-bold text-white">
      <div className="sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
};
