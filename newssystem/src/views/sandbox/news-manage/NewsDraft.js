import React, { useEffect, useState } from 'react'
import { Button, Table, Modal, notification} from 'antd'
import axios from 'axios'
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined, UploadOutlined} from '@ant-design/icons'

const {confirm} = Modal
 
export default function NewsDraft(props) {
  const [dataSource, setDataSource] = useState([])
  const {username} = JSON.parse(localStorage.getItem("token"))

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render:(id)=>{
        return <b>{id}</b>
      }
    },
    {
      title: '新闻标题',
      dataIndex: 'title',
      render:(title, item)=>{
        return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
      }
    },
    {
      title: '作者',
      dataIndex: 'author'
    },
    {
      title: '新闻分类',
      dataIndex: 'category',
      render:(category)=>{
        return category.title
      }
    },
    {
      title:'操作',
      render:(item)=>{
        return <div>
          <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>confirmMethod(item)}/>
          <Button shape='circle' icon={<EditOutlined/>} onClick={()=>{
            props.history.push(`/news-manage/update/${item.id}`)
          }}/>
          <Button type='primary' shape='circle' icon={<UploadOutlined/>} onClick={()=>handleCheck(item.id)}/>
        </div>
      }
    }
  ]

  useEffect(()=>{
    axios.get(`/news?author=${username}&auditState=0&_expand=category`).then(res=>{
      setDataSource(res.data)
    })
  }, [username])

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
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.delete(`/news/${item.id}`)
  }

  //提交审核
  const handleCheck = (id)=>{
    axios.patch(`/news/${id}`,{
      auditState:1
    }).then(res=>{
      props.history.push('/audit-manage/list')

      notification.info({
        message: "通知",
        description:
          `您可以到审核列表中查看您的新闻`,
        placement:'bottomRight',
      });
    })
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize:5
      }} rowKey={item=>item.id}/>
    </div>
  )
}

