const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full">
      <nav className="bg-white text-red-400 h-14 text-[32px]">
        <div className="text-red-400 text-[32px] m-2">ZaZa</div>
      </nav>
      <div className="flex items-center justify-center h-screen w-full place-self-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
