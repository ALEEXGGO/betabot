const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <img src="https://www.betabot.org/painel.gif" alt="Loading..." className="w-32 h-32" />
    </div>
  );
};

export default LoadingScreen;