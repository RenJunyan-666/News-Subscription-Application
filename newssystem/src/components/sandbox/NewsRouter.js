import React, { useEffect, useState } from 'react'
import Home from '../../views/sandbox/home/Home'
import UserList from '../../views/sandbox/user-manage/UserList'
import RightList from '../../views/sandbox/right-manage/RightList'
import RoleList from '../../views/sandbox/right-manage/RoleList'
import Nopermission from '../../views/sandbox/nopermission/Nopermission'
import NewsAdd from '../../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/sandbox/news-manage/NewsCategory'
import Audit from '../../views/sandbox/audit-manage/Audit'
import AuditList from '../../views/sandbox/audit-manage/AuditList'
import Unpublished from '../../views/sandbox/publish-manage/Unpublished'
import Published from '../../views/sandbox/publish-manage/Published'
import Sunset from '../../views/sandbox/publish-manage/Sunset'
import NewsPreview from '../../views/sandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/sandbox/news-manage/NewsUpdate'
import {Switch, Route, Redirect} from 'react-router-dom'
import axios from 'axios'

//通过后端传来的数据动态渲染相应路径
const LocalRouterMap = {
    "/home":Home,
    "/user-manage/list":UserList,
    "/right-manage/role/list":RoleList,
    "/right-manage/right/list":RightList,
    "/news-manage/add":NewsAdd,
    "/news-manage/draft":NewsDraft,
    "/news-manage/category":NewsCategory,
    "/news-manage/preview/:id":NewsPreview,
    "/news-manage/update/:id":NewsUpdate,
    "/audit-manage/audit":Audit,
    "/audit-manage/list":AuditList,
    "/publish-manage/unpublished":Unpublished,
    "/publish-manage/published":Published,
    "/publish-manage/sunset":Sunset
}

export default function NewsRouter() {
  const [backRouteList, setBackRouteList] = useState([])

  //请求后端权限
  useEffect(()=>{
    Promise.all([
        axios.get("/rights"),
        axios.get("/children")
    ]).then(res=>{
        setBackRouteList([...res[0].data, ...res[1].data])
    })
  }, [])

  const {role:{rights}} = JSON.parse(localStorage.getItem("token"))

  //判断权限列表中权限开关是否打开
  const checkRoute = (item)=>{
    return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
  }

  //判断该用户是否有该权限
  const checkUserPermission = (item)=>{
    return rights.includes(item.key)
  }

  return (
    <Switch>
        {
            backRouteList.map(item=>{
                if(checkRoute(item) && checkUserPermission(item)){ //权限开关打开且该用户拥有该权限才能显示路由
                    return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact/>
                }
                return null
            })
        }

        <Redirect from='/' to="/home" exact/>
        {
            backRouteList.length>0 && <Route path="*" component={Nopermission}/>
        }
    </Switch>
  )
}
