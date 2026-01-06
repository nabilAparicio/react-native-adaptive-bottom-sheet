const defaultTheme = (isDark?: boolean) => {
  if (isDark ?? false) {
    return {
      background: "#000000",
      border: "#D9D9D94D",
      backdrop: "#000000BF",
    };
  }
  return {
    background: "#FFFFFF",
    border: "#D9D9D94D",
    backdrop: "#000000BF",
  };
};

export default defaultTheme;
