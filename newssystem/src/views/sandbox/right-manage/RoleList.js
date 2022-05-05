import { Table, Button, Modal, Tree } from 'antd'
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const {confirm} = Modal

export default function RoleList() {
  const [dataSource, setDataSource] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [rightList, setRightList] = useState([])
  const [currentRights, setCurrentRights] = useState([])
  const [currentId, setCurrentId] = useState(0)
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render:(id)=>{
        return <b>{id}</b>
      }
    },
    {
      title: '角色名称',
      dataIndex: 'roleName'
    },
    {
      title:'操作',
      render:(item)=>{
        return <div>
          <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>confirmMethod(item)}/>

          <Button type='primary' shape='circle' icon={<EditOutlined/>} onClick={()=>{
            setIsModalVisible(true)
            setCurrentRights(item.rights)
            setCurrentId(item.id)
          }}/>
        </div>
      }
    }
  ]

  //请求角色
  useEffect(()=>{
    axios.get("/roles").then(res=>{
      //console.log(res.data)
      setDataSource(res.data)
    })
  }, [])

  //请求角色权限
  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      //console.log(res.data)
      setRightList(res.data)
    })
  }, [])

  //确认是否删除角色
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

  //删除角色
  const deleteMethod = (item)=>{
    //当前页面同步状态 + 后端同步
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.delete(`/roles/${item.id}`)
  }

  //弹出框确认
  const handleOk = ()=>{
    //console.log(currentRights)
    setIsModalVisible(false)

    //同步datasource
    setDataSource(dataSource.map(item=>{
      if(item.id === currentId){
        return {
          ...item,
          rights:currentRights
        }
      }
      return item
    }))

    axios.patch(`/roles/${currentId}`, {
      rights:currentRights
    })
  }

  //弹出框关闭
  const handleCancel = ()=>{
    setIsModalVisible(false)
  }

  const onCheck = (checkedKeys)=>{
    //console.log(checkedKeys)
    setCurrentRights(checkedKeys.checked)
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} rowKey={(item)=>item.id}></Table>

      <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Tree
          checkable
          checkedKeys={currentRights}
          onCheck={onCheck}
          checkStrictly = {true}
          treeData={rightList}
        />
      </Modal>
    </div>
  )
}
