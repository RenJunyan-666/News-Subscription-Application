import { useEffect, useState } from 'react'
import axios from 'axios'
import { notification } from 'antd'

/**
 * 自定义hooks函数处理发布管理中代码几乎一样的复用问题
 */
function usePublish(type){
    const {username} = JSON.parse(localStorage.getItem("token"))
    const [dataSource, setDateSource] = useState([])

    useEffect(()=>{
        axios.get(`/news?author=${username}&publishState=${type}&_expand=category`).then(res=>{
        setDateSource(res.data)
        })
    }, [username, type])

    //发布
    const handlePublish = (id)=>{
        setDateSource(dataSource.filter(item=>item.id!==id))
        axios.patch(`/news/${id}`, {
            "publishState": 2,
            "publishTime":Date.now()
          }).then(res=>{
            notification.info({
              message: "通知",
              description:
                `您可以到发布管理/已发布中查看您的新闻`,
              placement:'bottomRight',
            });
        })
    }

    //下线
    const handleSunset = (id)=>{
        setDateSource(dataSource.filter(item=>item.id!==id))
        axios.patch(`/news/${id}`, {
            "publishState": 3
          }).then(res=>{
            notification.info({
              message: "通知",
              description:
                `您可以到发布管理/已下线中查看您的新闻`,
              placement:'bottomRight',
            });
        })
    }

    //删除
    const handleDelete = (id)=>{
        setDateSource(dataSource.filter(item=>item.id!==id))
        axios.delete(`/news/${id}`).then(res=>{
            notification.info({
              message: "通知",
              description:
                `您已经删除了该新闻`,
              placement:'bottomRight',
            });
        })
    }
    
    return {
        dataSource,
        handlePublish,
        handleSunset,
        handleDelete
    }
}

export default usePublish