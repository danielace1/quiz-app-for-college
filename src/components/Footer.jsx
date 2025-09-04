const Footer = () => {
  return (
    <footer className="py-4 bg-transparent bg-none">
      <p className="text-sm text-gray-600 text-center">
        &copy; {new Date().getFullYear()}{" "}
        <span className="font-semibold text-blue-700">Quiz Craze</span>. All
        rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
