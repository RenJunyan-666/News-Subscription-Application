import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Button, notification } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

export default function Audit() {
  const [dataSource, setDataSource] = useState([])
  const {roleId,region,username} = JSON.parse(localStorage.getItem("token"))

  const columns = [
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
        return <div>{category.title}</div>
      }
    },
    {
      title:'操作',
      render:(item)=>{
        return <div>
          <Button type="primary" onClick={()=>handleAudit(item,2,1)} icon={<CheckCircleOutlined />} shape='circle'/>
          <Button danger onClick={()=>handleAudit(item,3,0)} icon={<CloseCircleOutlined />} shape='circle'/>
        </div>
      }
    }
  ]

  useEffect(()=>{
    //角色对应id
    const roleObj = {
      "1":"superadmin",
      "2":"admin",
      "3":"editor"
    }

    axios.get(`/news?auditState=1&_expand=category`).then(res=>{ //管理员可以审核全部新闻，区域编辑只能审核自己所属区域内的区域编辑的新闻
      setDataSource(roleObj[roleId]==="superadmin"?res.data:[
        ...res.data.filter(item=>item.author===username),
        ...res.data.filter(item=>item.region===region && roleObj[item.roleId]==="editor")
      ])
    })
  },[roleId, region, username])

  //发布
  const handleAudit = (item, auditState, publishState)=>{
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.patch(`/news/${item.id}`, {
      auditState,
      publishState
    }).then(res=>{
      notification.info({
        message: "通知",
        description:
          `您可以到审核管理/审核列表中查看您的新闻的审核状态`,
        placement:'bottomRight',
      })
    })
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize:5
      }}
      rowKey={item=>item.id}/>
    </div>
  )
}
