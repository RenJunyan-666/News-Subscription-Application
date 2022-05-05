import React from 'react'
import { Editor, EditorState, convertToRaw } from "draft-js";
import draftToHtml from 'draftjs-to-html'
import "draft-js/dist/Draft.css";

export default function NewsEditor(props) {
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const editor = React.useRef(null);
  function focusEditor() {
    editor.current.focus();
  }

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
