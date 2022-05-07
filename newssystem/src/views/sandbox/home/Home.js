import React, { useEffect, useRef, useState } from 'react'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons'
import axios from 'axios'
import * as Echarts from 'echarts'
import _ from 'lodash'

const { Meta } = Card

export default function Home() {
  const [viewList, setViewList] = useState([])
  const [starList, setStarList] = useState([])
  const [visible, setVisible] = useState(false)
  const [allList, setAllList] = useState([])
  const {username, region, role:{roleName}} = JSON.parse(localStorage.getItem("token"))
  const [pieChart, setPieChart] = useState(null)
  const barRef = useRef()
  const pieRef = useRef()

  //访问最多
  useEffect(()=>{
    axios.get('news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6').then(res=>{
      setViewList(res.data)
    })
  },[])

  //点赞最多
  useEffect(()=>{
    axios.get('news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6').then(res=>{
      setStarList(res.data)
    })
  },[])

  //图表
  useEffect(()=>{
    axios.get("/news?publishState=2&_expand=category").then(res=>{
      //console.log(res.data)
      //console.log(_.groupBy(res.data,item=>item.category.title))
      renderBarView(_.groupBy(res.data,item=>item.category.title))
      setAllList(res.data)
    })

    //组件销毁时停用resize
    return ()=>{
      window.onresize = null
    }
  },[])

  //柱状图表dom结构
  const renderBarView = (obj)=>{
    // 基于准备好的dom，初始化echarts实例
    var myChart = Echarts.init(barRef.current)

    // 指定图表的配置项和数据
    var option = {
      title: {
        text: '新闻分类图示'
      },
      tooltip: {},
      legend: {
        data: ['数量']
      },
      xAxis: {
        data: Object.keys(obj),
        axisLabel:{
          rotate:"45",
          interval:0
        }
      },
      yAxis: {
        minInterval:1
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: Object.values(obj).map(item=>item.length)
        }
      ]
    }

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)

    window.onresize = ()=>{
      myChart.resize()
    }
  }

  //饼状图表dom结构
  const renderPieView = (obj)=>{
    //处理数据，找到当前用户的新闻分类
    var currentList = allList.filter(item=>item.author===username)
    var groupObj = _.groupBy(currentList, item=>item.category.title)
    var list = []
    for(var i in groupObj){
      list.push({
        name:i,
        value:groupObj[i].length
      })
    }
    //console.log(list)

    var myChart
    //第一次初始化，之后不用了
    if(!pieChart){
      myChart = Echarts.init(pieRef.current)
      setPieChart(myChart)
    }
    else{
      myChart = pieChart
    }
    var option;

    option = {
      title: {
        text: '当前用户新闻分类图示',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '发布数量',
          type: 'pie',
          radius: '50%',
          data: list,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
};

option && myChart.setOption(option);
  }
  
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card title="用户最常浏览" bordered={true}>
            <List
              size="small"
              dataSource={viewList}
              renderItem={item => <List.Item>
                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
              </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="用户点赞最多" bordered={true}>
            <List
              size="small"
              dataSource={starList}
              renderItem={item => <List.Item>
                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
              </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            cover={
              <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
              />
            }
            actions={[
              <SettingOutlined key="setting" onClick={()=>{
                // setTimeout(() => {
                //   setVisible(true)
                //   renderPieView() //初始化饼状图
                // }, 0);
                setTimeout(() => {
                  setVisible(true)
                  renderPieView() //初始化饼状图
                }, 0)
              }}/>,
              <EditOutlined key="edit" />,
              <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={username}
              description={
                <div>
                  <b>{region?region:"全球"}</b>
                  <span style={{paddingLeft:"30px"}}>{roleName}</span>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* i饼状图 */}
      <Drawer 
      title="个人新闻分类" 
      placement="right"
      closable={true} 
      onClose={()=>{
        setVisible(false)
      }} 
      visible={visible}
      width="500px"
      >
        <div ref={pieRef} style={{
          width:"100%",
          height:"400px",
          marginTop:"30px"
        }}></div>
      </Drawer>

      {/* 柱状图 */}
      <div ref={barRef} style={{
        width:"100%",
        height:"400px",
        marginTop:"30px"
      }}></div>
    </div>
  )
}
