import React, { useEffect } from 'react'
import { Editor, EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import "draft-js/dist/Draft.css";

export default function NewsEditor(props) {
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const editor = React.useRef(null);
  function focusEditor() {
    editor.current.focus();
  }

  //接收父组件传来的新闻内容
  useEffect(()=>{
    //console.log(props.content)
    //将内容重新放入富文本编译器
    const html = props.content
    if(html===undefined) return //如果是创建里进入择不进行该函数
    const contentBlock = htmlToDraft(html)
    if(contentBlock){
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      setEditorState(editorState)
    }

  },[props.content])

  return (
    <div
      style={{ border: "1px solid black", minHeight: "6em", cursor: "text" }}
      onClick={focusEditor}
    >
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={(editorState)=>{
            setEditorState(editorState)
        }}
        placeholder="Write something!"
        onBlur={()=>{
            props.getContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
        }}
      />
    </div>
  );
  
}
