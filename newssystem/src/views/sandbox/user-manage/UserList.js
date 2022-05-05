import React, { useEffect, useState, useRef } from 'react'
import { Button, Table, Modal, Switch } from 'antd'
import axios from 'axios'
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined} from '@ant-design/icons'
import UserForm from '../../../components/user-manage/UserForm'

const {confirm} = Modal
 
export default function UserList() {
  const [dataSource, setDataSource] = useState([])
  const [isAddVisible, setIsAddVisible] = useState(false)
  const [roleList, setRoleList] = useState([])
  const [regionList, setRegionList] = useState([])
  const [isUpdateVisible, setIsUpdateVisible] = useState(false)
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(false)
  const [current, setCurrent] = useState(null)
  const addForm = useRef(null)
  const updateForm = useRef(null)
  const {roleId,region,username} = JSON.parse(localStorage.getItem("token"))

  //权限列表的框架
  const columns = [
    {
      title: '区域',
      dataIndex: 'region',
      filters:[
        ...regionList.map(item=>({
          text:item.title,
          value:item.value
        })),
        {
          text:"全球",
          value:"全球"
        }
      ],
      onFilter:(value, item)=>{
        if(value==="全球"){
          return item.region===""
        }
        return item.region===value
      },
      render:(region)=>{
        return <b>{region===""?"全球":region}</b>
      }
    },
    {
      title: '角色名称',
      dataIndex: 'role',
      render:(role)=>{
        return role?.roleName
      }
    },
    {
      title: '用户名',
      dataIndex: 'username'
    },
    {
      title: '用户状态',
      dataIndex: 'roleState',
      render:(roleState, item)=>{
        return <Switch checked={roleState} disabled={item.default} onChange={()=>handleChange(item)}></Switch>
      }
    },
    {
      title:'操作',
      render:(item)=>{
        return <div>
          <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>confirmMethod(item)} disabled={item.default}/>

          <Button type='primary' shape='circle' icon={<EditOutlined/>} disabled={item.default} onClick={()=>handleUpdate(item)}/>
        </div>
      }
    }
  ]

  //请求用户
  useEffect(()=>{
    //角色对应id
    const roleObj = {
      "1":"superadmin",
      "2":"admin",
      "3":"editor"
    }

    axios.get("/users?_expand=role").then(res=>{
      //如果是超级管理员，则展示全部列表，如果是区域管理员，则只能看到自己以及自己所属区域下的区域编辑
      setDataSource(roleObj[roleId]==="superadmin"?res.data:[
        ...res.data.filter(item=>item.username===username),
        ...res.data.filter(item=>item.region===region && roleObj[item.roleId]==="editor")
      ])
    })
  }, [region,roleId,username])

  //请求角色
  useEffect(()=>{
    axios.get("/roles").then(res=>{
      setRoleList(res.data)
    })
  }, [])

  //请求区域
  useEffect(()=>{
    axios.get("/regions").then(res=>{
      setRegionList(res.data)
    })
  }, [])

  //确认是否删除用户
  const confirmMethod = (item)=>{
    confirm({
      title: '你确定要删除吗？',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteMethod(item)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  //删除权限
  const deleteMethod = (item)=>{
    //当前页面同步状态 + 后端同步
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.delete(`/users/${item.id}`)
  }

  //添加成功事件
  const addFormOk = ()=>{
    addForm.current.validateFields().then(value=>{
      setIsAddVisible(false)
      addForm.current.resetFields() //重置

      //post到后端，生成id，再设置datasource，方便后面删除和更新
      axios.post(`/users`, {
        ...value,
        "roleState":true,
        "default":false
      }).then(res=>{
        setDataSource([...dataSource, {
          ...res.data,
          role:roleList.filter(item=>item.id===value.roleId)[0]
        }])
      })
    }).catch(err=>{
      console.log(err)
    })
  }

  //弹出修改框
  const handleUpdate = (item)=>{
    setTimeout(()=>{
      setIsUpdateVisible(true)
      if(item.roleId===1){
        //禁用
        setIsUpdateDisabled(true)
      }
      else{
        //取消禁用
        setIsUpdateDisabled(false)
      }
      //updateForm.current.setFieldsValue(item) //绑定原先的值
    },0)
    setCurrent(item)
  }

  //修改用户状态
  const handleChange = (item)=>{
    //console.log(item)
    item.roleState = !item.roleState
    setDataSource([...dataSource])
    axios.patch(`/users/${item.id}`, {
      roleState:item.roleState
    })
  }

  //修改用户信息
  const updateFormOk = ()=>{
    updateForm.current.validateFields().then(value=>{
      setIsUpdateVisible(false)
      setDataSource(dataSource.map(item=>{
        if(item.id===current.id){
          return {
            ...item,
            ...value,
            role:roleList.filter(data=>data.id===value.roleId)[0]
          }
        }
        return item
      }))
      setIsUpdateDisabled(!isUpdateDisabled)
      axios.patch(`/users/${current.id}`, value)
    }).catch(err=>{
      console.log(err)
    })
  }

  return (
    <div>
      <Button type='primary' onClick={()=>{
        setIsAddVisible(true)
      }}>添加用户</Button>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize:5
      }}
      rowKey={item=>item.id}/>

      {/* 添加用户弹出框 */}
      <Modal
        visible={isAddVisible}
        title="添加用户"
        okText="确定"
        cancelText="取消"
        onCancel={()=>{
          setIsAddVisible(false)
        }}
        onOk={() => addFormOk()}
      >
        <UserForm regionList={regionList} roleList={roleList} ref={addForm}/>
      </Modal>

      {/* 更新用户弹出框 */}
      <Modal
        visible={isUpdateVisible}
        title="更新用户"
        okText="更新"
        cancelText="取消"
        onCancel={()=>{
          setIsUpdateVisible(false)
          setIsUpdateDisabled(!isUpdateDisabled)
        }}
        onOk={() => updateFormOk()}
      >
        <UserForm 
        regionList={regionList} 
        roleList={roleList} 
        ref={updateForm} 
        isUpdateDisabled={isUpdateDisabled}
        isUpdate={true}/>
      </Modal>
    </div>
  )
}
