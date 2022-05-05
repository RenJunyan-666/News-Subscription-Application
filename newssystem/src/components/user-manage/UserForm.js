import React, { forwardRef, useEffect, useState } from 'react'
import {Form, Input, Select} from 'antd'

const {Option} = Select

const UserForm = forwardRef((props, ref)=>{
  const [isDisable, setIsDisable] = useState(false)

  useEffect(()=>{
    setIsDisable(props.isUpdateDisabled)
  }, [props.isUpdateDisabled])

  const {roleId,region} = JSON.parse(localStorage.getItem("token"))
  const roleObj = {
    "1":"superadmin",
    "2":"admin",
    "3":"editor"
  }

  //根据更新或者添加来判断区域列表和角色列表显示的数据
  const checkRegionDisabled = (item)=>{
    if(props.isUpdate){ //更新
      if(roleObj[roleId]==="superadmin"){ //如果是超级管理员，所有区域均可以分配
        return false
      }
      else{ //如果不是，则不能更新区域，因为自己只能管理自己所属区域的用户
        return true
      }
    }
    else{ //添加
      if(roleObj[roleId]==="superadmin"){ //如果是超级管理员，所有区域均可以分配
        return false
      }
      else{ //如果不是，只能添加自己区域下的用户
        return item.value!==region
      }
    }
  }

  const checkRoleDisabled = (item)=>{
    if(props.isUpdate){ //更新
      if(roleObj[roleId]==="superadmin"){ //如果是超级管理员，所有角色均可以分配
        return false
      }
      else{ //如果不是，则不能更新角色，因为只能管理区域编辑
        return true
      }
    }
    else{ //添加
      if(roleObj[roleId]==="superadmin"){ //如果是超级管理员，所有角色均可以分配
        return false
      }
      else{ //如果不是，只能添加区域编辑
        return roleObj[item.id]!=="editor"
      }
    }
  }

  return (
    <Form layout="vertical" ref={ref}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '该字段不能为空！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '该字段不能为空！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="region"
            label="区域"
            rules={isDisable?[]:[{ required: true, message: '该字段不能为空！' }]}
          >
            <Select disabled={isDisable}>
              {
                props.regionList.map(item=>
                <Option 
                value={item.value} 
                key={item.id} 
                disabled={checkRegionDisabled(item)}>
                  {item.title}
                </Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="roleId"
            label="角色"
            rules={[{ required: true, message: '该字段不能为空！' }]}
          >
            <Select onChange={(value)=>{
                //console.log(value)
                if(value === 1){ //超级管理员禁用区域
                    setIsDisable(true)
                    ref.current.setFieldsValue({ //清空被禁用的下拉列表
                        region:""
                    })
                }
                else{
                    setIsDisable(false)
                }
            }}>
              {
                props.roleList.map(item=>
                <Option 
                value={item.id} 
                key={item.id}
                disabled={checkRoleDisabled(item)}>
                  {item.roleName}
                </Option>)
              }
            </Select>
          </Form.Item>
    </Form>
  )
})
export default UserForm