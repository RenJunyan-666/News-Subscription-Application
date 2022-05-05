import React, { useEffect, useState } from 'react'
import { Button, Table, Tag, Modal, Popover, Switch } from 'antd'
import axios from 'axios'
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined} from '@ant-design/icons'

const {confirm} = Modal
 
export default function RightList() {
  //权限列表中的内容
  const [dataSource, setDataSource] = useState([])

  //权限列表的框架
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render:(id)=>{
        return <b>{id}</b>
      }
    },
    {
      title: '权限名称',
      dataIndex: 'title'
    },
    {
      title: '权限路径',
      dataIndex: 'key',
      render:(key)=>{
        return <Tag color="orange">{key}</Tag>
      }
    },
    {
      title:'操作',
      render:(item)=>{
        return <div>
          <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>confirmMethod(item)}/>

          <Popover 
          content={<div style={{textAlign:'center'}}>
            <Switch checked={item.pagepermisson} onChange={()=>switchMethod(item)}></Switch>
          </div>} 
          title="页面配置项" 
          trigger={item.pagepermisson===undefined?'':'click'}>
            <Button 
            type='primary' 
            shape='circle' 
            icon={<EditOutlined/>} 
            disabled={item.pagepermisson === undefined}/>
          </Popover>
        </div>
      }
    }
  ]

  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      //去掉首页children
      const list = res.data
      list.forEach(item=>{
        if(item.children.length === 0){
          item.children = ''
        }
      })
      setDataSource(list)
    })
  }, [])

  //确认是否删除权限
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
    if(item.grade === 1){ //grade表示当前权限的层级
      setDataSource(dataSource.filter(data=>data.id!==item.id))
      axios.delete(`/rights/${item.id}`)
    }
    else{
      let list = dataSource.filter(data=>data.id === item.rightId)
      list[0].children = list[0].children.filter(data=>data.id !== item.id)
      setDataSource([...dataSource]) //重新展开触发新的更新
      axios.delete(`/children/${item.id}`)
    }
  }

  //修改权限级别pagepermisson
  const switchMethod = (item)=>{
    item.pagepermisson = item.pagepermisson===1?0:1
    setDataSource([...dataSource])
    if(item.grade === 1){
      axios.patch(`/rights/${item.id}`, {
        pagepermisson:item.pagepermisson
      })
    }
    else{
      axios.patch(`/children/${item.id}`, {
        pagepermisson:item.pagepermisson
      })
    }
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize:5
      }}/>
    </div>
  )
}
