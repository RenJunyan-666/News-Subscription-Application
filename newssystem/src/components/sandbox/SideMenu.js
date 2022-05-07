import React, { useEffect, useState } from 'react'
import './index.css'
import {withRouter} from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  UserOutlined
} from '@ant-design/icons'
import SubMenu from 'antd/lib/menu/SubMenu'
import axios from 'axios'
import {connect} from 'react-redux'

const { Sider } = Layout
const iconList = { //图标映射表
  "/home":<UserOutlined/>,
  "/user-manage":<UserOutlined/>,
  "/user-manage/list":<UserOutlined/>,
  "/right-manage":<UserOutlined/>,
  "/right-manage/role/list":<UserOutlined/>,
  "/right-manage/right/list":<UserOutlined/>
}

function SideMenu(props) {
  const [menu, setMenu] = useState([])

  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      //console.log(res.data)
      setMenu(res.data)
    })
  }, [])
  //获取当前用户信息
  const {role:{rights}} = JSON.parse(localStorage.getItem("token"))

  //获取当前权限下的权限
  const checkPagePermission = (item)=>{
    return item.pagepermisson && rights.includes(item.key)
  }

  const renderMenu = (menuList)=>{
    return menuList.map(item=>{
      if(item.children?.length>0 && checkPagePermission(item)){
        return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
          {renderMenu(item.children)}
        </SubMenu>
      }
      return checkPagePermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={()=>{
        props.history.push(item.key)
      }}>{item.title}</Menu.Item>
    })
  }

  //处理重新刷新页面时选中项不会展开并高亮选中的问题
  const selectKeys = [props.location.pathname] //选中的页面
  const openKeys = ["/"+props.location.pathname.split("/")[1]] //获取当前选中的路径的父路径

  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed}>
      <div style={{display:"flex", height:"100%", "flexDirection":"column"}}>
        <div className="logo">全球新闻发布管理系统</div>
        <div style={{flex:1,"overflow":"auto"}}>
          <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectKeys}
              defaultOpenKeys={openKeys}
          >
            {renderMenu(menu)}
          </Menu>
        </div>
      </div>
    </Sider>
  )
}

const mapStateToProps = ({collapsedReducer:{isCollapsed}})=>{
  return {
    isCollapsed
  }
}

export default connect(mapStateToProps)(withRouter(SideMenu)) //跨级通信，将props从route组件传给sidemenu
