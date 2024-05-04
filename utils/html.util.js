const sanitize = (string) => {
  if (typeof string === 'string') {
    return string.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  return null;
};

export default { sanitize };
