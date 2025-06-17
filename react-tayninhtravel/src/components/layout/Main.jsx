export function Main() {
  const navigate = useNavigate();
  const user = StorageService.getUser();
  const role = StorageService.getRoleLogin();
  const tokenExpiry = StorageService.getTokenExpiry(); // expects ISO string

  // Token expired event listener
  React.useEffect(() => {
    const handleTokenExpired = () => {
      StorageService.clearAll();
      notification.warning({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      navigate('/sign-in');
    };
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [navigate]);

  useEffect(() => {
    // Not logged in
    if (!user?.userId) {
      navigate('/sign-in');
      return;
    }
    // Immediate token expiry check
    if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
      window.dispatchEvent(new Event('tokenExpired'));
      return;
    }
    // Role-based guard: only Company can access
    if (role !== 'company') {
      notification.error({ message: 'Bạn không có quyền truy cập.' });
      navigate('/unauthorized');
      return;
    }
  }, [navigate, user, role, tokenExpiry]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Sidenav allowedRole="company" />
      </Sider>
      <Layout>
        <AntHeader style={{ background: '#fff', padding: 0 }}>
          <Header />
        </AntHeader>
        <Content style={{ margin: '24px 16px 0' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default Main;
