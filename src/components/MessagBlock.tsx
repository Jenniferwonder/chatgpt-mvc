import { useState, useEffect, useRef, type FC } from "react";
import {
  Box,
  Avatar,
  Typography,
  Alert,
  SvgIcon,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import OpenAIIcon from "./OpenAIIcon";
import parser from "../markdown-parser";
import { type MessageModel } from "../api/chat";

type MessageBlockProps = {
  model: MessageModel;
  onFinishTyping: () => void;
};



const splitHTMLString = (htmlString: string) => {
  const result: string[] = [];
  let currentTag = "";
  for (let i = 0; i < htmlString.length; i++) {
    const c = htmlString[i];
    if (c === "<") {
      currentTag += c;
    } else if (c === ">") {
      currentTag += c;
      result.push(currentTag);
      currentTag = "";
    } else if (currentTag !== "") {
      currentTag += c;
    } else {
      result.push(c);
    }
  }
  return result;
};

const MessageBlock: FC<MessageBlockProps> = ({ model, onFinishTyping }) => {
  const [thinking, setThinking] = useState(false);
  const [parsedHTML, setParsedHTML] = useState("");
  const [displayInnerHTML, setDisplayInnerHTMLText] = useState("");
  const messageBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () =>
      setParsedHTML(
        model.role === "assistant" ? await parser(model.content) : model.content
      ))();
  }, [model.content]);

  useEffect(() => {
    if (model.role !== "user") {
      setThinking(true);
      if (model.type !== "typing" && parsedHTML !== "") {
        let typingTimer: number | null | undefined = null;
        let i = 0;
        const htmlStringFragments = splitHTMLString(parsedHTML);
        const typeFragment = (currentIndex: number) => {
          if (currentIndex === htmlStringFragments.length - 1) {
            clearTimeout(typingTimer!);
            setThinking(false);
            setDisplayInnerHTMLText("");
            onFinishTyping();
          } else {
            setDisplayInnerHTMLText(
              (prevText) => prevText + htmlStringFragments[currentIndex]
            );
            typingTimer = setTimeout(() => typeFragment(++i), 10);
          }
        };
        typeFragment(i);
        return () => clearTimeout(typingTimer!);
      }
    }
  }, [parsedHTML, model.type]);

  useEffect(() => {
    // scroll to the bottom when it's view updated
    const scrollChatBox = messageBlockRef.current?.parentElement?.parentElement;
    if (scrollChatBox) {
      scrollChatBox.scrollTop = scrollChatBox.scrollHeight;
    }
  }, [thinking, displayInnerHTML]);

  return (
    <Box display="flex" sx={{ pt: 2, pb: 4 }} ref={messageBlockRef}>
      <Avatar
        sx={{
          bgcolor: model.role === "user" ? "#f6bf00" : "#4cc979",
          mr: 2,
          width: 32,
          height: 32,
        }}
      >
        {model.role === "user" ? (
          <PersonIcon sx={{ color: "#FFFFFF" }} />
        ) : (
          <SvgIcon>
            <OpenAIIcon />
          </SvgIcon>
        )}
      </Avatar>
      <Box display="flex" flexDirection="column" sx={{ width: 0, flexGrow: 1 }}>
        <Typography
          component="div"
          sx={{
            fontWeight: 800,
            lineHeight: 2,
          }}
        >
          {model.role === "user" ? "You" : "ChatGPT"}
        </Typography>
        {model.type === "error" ? (
          <Alert
            icon={false}
            severity="error"
            sx={{
              mt: 1,
              border: (theme) => `1px solid ${theme.palette.error.light}`,
            }}
          >
            {model.content}
          </Alert>
        ) : (
          <Typography
            component="div"
            dangerouslySetInnerHTML={{
              __html: thinking
                // ? displayInnerHTML + `<span class="${classes.thinking}"></span>`
                ? displayInnerHTML + `<span class="thinking"></span>`
                : parsedHTML,
            }}
            sx={{
              width: "100%",
              lineHeight: 2,
              "& > *": {
                my: 0,
              },
              "& > pre": {
                p: 2,
                my: 1,
                overflow: "auto",
                borderRadius: 1,
                fontSize: 14,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageBlock;
