import React, { useState } from 'react'
import { Layout, Dropdown, Menu, Avatar } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined, 
  UserOutlined
} from '@ant-design/icons'
import {withRouter} from 'react-router-dom'

const { Header } = Layout

function TopHeader(props) {
  //侧边栏拉伸
  const [collapsed, setCollapsed] = useState(false)
  const changeCollapsed = ()=>{
    setCollapsed(!collapsed)
  }

  //获取当前用户信息
  const {role:{roleName},username} = JSON.parse(localStorage.getItem("token"))

  //下拉菜单
  const menu = (
    <Menu>
      <Menu.Item>
        {roleName}
      </Menu.Item>
      <Menu.Item danger onClick={()=>{
        localStorage.removeItem("token")
        props.history.replace("/login")
      }}>
        退出
      </Menu.Item>
    </Menu>
  );  

  return (
    <Header className="site-layout-background" style={{ padding: '0 16px' }}>
      {
        collapsed?<MenuUnfoldOutlined onClick={changeCollapsed}/>:<MenuFoldOutlined onClick={changeCollapsed}/>
      }

      <div style={{float:"right"}}>
        <span>欢迎<span style={{color:"#1890ff"}}>{username}</span>回来</span>
        <Dropdown overlay={menu}>
          <Avatar size="large" icon={<UserOutlined />}/>
        </Dropdown>
      </div>
    </Header>
  )
}
export default withRouter(TopHeader)
