const cookieUtil = {};

cookieUtil.clearToken = (res) => {
  // Token expires in 10 seconds
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    sameSite: 'None',
    secure: true
  });
};

export default cookieUtil;
