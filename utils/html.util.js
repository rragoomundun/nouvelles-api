const sanitize = (string) => {
  return string.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

export default { sanitize };
