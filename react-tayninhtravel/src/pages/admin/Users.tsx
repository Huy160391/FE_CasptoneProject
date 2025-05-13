import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, Select } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './Users.scss'

const { Option } = Select

const Users = () => {
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingUser, setEditingUser] = useState<any>(null)
  
  // Mock data for users
  const users = [
    {
      key: '1',
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      role: 'admin',
      status: 'active',
    },
    {
      key: '2',
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      role: 'user',
      status: 'active',
    },
    {
      key: '3',
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      role: 'user',
      status: 'inactive',
    },
    {
      key: '4',
      id: 4,
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      role: 'user',
      status: 'active',
    },
    {
      key: '5',
      id: 5,
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      role: 'editor',
      status: 'active',
    },
  ]
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: string, record: any) => 
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.email.toLowerCase().includes(value.toLowerCase()) ||
        record.phone.includes(value),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = ''
        if (role === 'admin') color = 'red'
        else if (role === 'editor') color = 'blue'
        else color = 'green'
        
        return <Tag color={color}>{role.toUpperCase()}</Tag>
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Editor', value: 'editor' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value: string, record: any) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'success' : 'error'
        const text = status === 'active' ? 'Hoạt động' : 'Không hoạt động'
        
        return <Tag className={`status-tag ${color}`}>{text}</Tag>
      },
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value: string, record: any) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ]
  
  const handleSearch = (value: string) => {
    setSearchText(value)
  }
  
  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }
  
  const handleEdit = (user: any) => {
    setEditingUser(user)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    })
    setIsModalVisible(true)
  }
  
  const handleDelete = (user: any) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng "${user.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Handle delete logic here
        console.log('Deleted user:', user)
      },
    })
  }
  
  const handleModalOk = () => {
    form.validateFields().then(values => {
      // Handle form submission
      console.log('Form values:', values)
      
      if (editingUser) {
        // Update existing user
        console.log('Updating user:', editingUser.id, values)
      } else {
        // Add new user
        console.log('Adding new user:', values)
      }
      
      setIsModalVisible(false)
    })
  }
  
  const handleModalCancel = () => {
    setIsModalVisible(false)
  }
  
  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm người dùng
          </Button>
        </div>
      </div>
      
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="users-table"
      />
      
      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingUser ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="editor">Editor</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default Users
