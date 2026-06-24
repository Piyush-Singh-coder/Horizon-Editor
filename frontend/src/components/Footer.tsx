const Footer = () => {
  return (
    <footer className="py-8 bg-gradient-to-t from-bg-tertiary via-bg-secondary/50 to-bg-primary text-text-secondary border-t border-border-primary/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="font-semibold text-base sm:text-lg tracking-wide text-text-primary">
          Built by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary transition-all duration-300">
            developer
          </span>
          , but not for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500 hover:from-amber-500 hover:to-pink-500 transition-all duration-300">
            developer
          </span>
          .
        </p>
        <p className="text-xs text-text-muted mt-2">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-primary">Horizon - Code Editor</span> | All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;