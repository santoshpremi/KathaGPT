import { useState } from "react";
import { Error as ErrorIcon } from "@mui/icons-material";
import { ErrorMessageOptions } from "./ErrorMessageOptions";
import { MessageEditor } from "../../MessageEditor";
import { ErrorMessageText } from "./ErrorMessageText";
import { ChatItemLayout } from "../../ChatItemLayout";
import { type LlmName } from "@backend/ai/llmMeta";
import { type Message } from "@backend/api/chat/message/messageTypes";
import { useGuidelines } from "../../../../../lib/api/guidelines";

export function ErrorMessage({
  message,
  onEdit,
  selectModel,
}: {
  message: Message;
  onEdit: (content: string) => void;
  selectModel: (model: LlmName) => void;
}) {
  const [errorCode, errorCodeDetails] = message.errorCode?.split(":") ?? [];
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const { accepted, lastUpdated } = useGuidelines();

  const onEditSafe = (newContent: string) => {
    if (
      newContent.trim().length > 0 &&
      newContent.trim() !== message.content.trim()
    ) {
      onEdit(newContent);
    }
    setEditing(false);
    setEditedContent(message.content);
  };

  return (
    <ChatItemLayout
      icon={<ErrorIcon sx={{ fontSize: "38px", color: "#404040" }} />}
      message={message}
      error
    >
      <div style={{ minHeight: "3rem" }}>
        <div>
          {editing ? (
            <MessageEditor
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              setEditing={setEditing}
              onEditSafe={onEditSafe}
            />
          ) : (
            <>
              <ErrorMessageText
                errorCode={errorCode}
                errorCodeDetails={errorCodeDetails}
                guidelines={accepted ? lastUpdated : null}
                message={message}
              />
              <ErrorMessageOptions
                errorCode={errorCode}
                errorCodeDetails={errorCodeDetails}
                guidelines={accepted ? lastUpdated : null}
                message={message}
                onEdit={onEdit}
                selectModel={selectModel}
                setEditing={setEditing}
              />
            </>
          )}
        </div>
      </div>
    </ChatItemLayout>
  );
}
