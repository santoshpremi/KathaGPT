import { useEffect, useRef } from "react";
import {
  useToolSessionStore,
  type ImageToolSession,
  type MeetingToolSession,
  type ResearchToolSession,
  type TranslatorToolSession,
} from "../tools/toolSessionStore";

type ToolKey = "image" | "translator" | "research" | "meeting";

/** Keep tool UI state in session store so it survives navigation between apps. */
export function useToolSessionSync(
  tool: ToolKey,
  session:
    | ImageToolSession
    | TranslatorToolSession
    | ResearchToolSession
    | MeetingToolSession,
  hasContent: boolean,
  fingerprint: string,
) {
  const isFirst = useRef(true);

  useEffect(() => {
    const state = useToolSessionStore.getState();

    if (isFirst.current) {
      isFirst.current = false;
      switch (tool) {
        case "image":
          state.setImage(session as ImageToolSession);
          if (state.imageBaseline === null) {
            state.setImageBaseline(fingerprint);
          }
          state.setImageDirty(
            hasContent && fingerprint !== state.imageBaseline,
          );
          break;
        case "translator":
          state.setTranslator(session as TranslatorToolSession);
          if (state.translatorBaseline === null) {
            state.setTranslatorBaseline(fingerprint);
          }
          state.setTranslatorDirty(
            hasContent && fingerprint !== state.translatorBaseline,
          );
          break;
        case "research":
          state.setResearch(session as ResearchToolSession);
          if (state.researchBaseline === null) {
            state.setResearchBaseline(fingerprint);
          }
          state.setResearchDirty(
            hasContent && fingerprint !== state.researchBaseline,
          );
          break;
        case "meeting":
          state.setMeeting(session as MeetingToolSession);
          if (state.meetingBaseline === null) {
            state.setMeetingBaseline(fingerprint);
          }
          state.setMeetingDirty(
            hasContent && fingerprint !== state.meetingBaseline,
          );
          break;
      }
      return;
    }

    switch (tool) {
      case "image":
        state.setImage(session as ImageToolSession);
        state.setImageDirty(hasContent && fingerprint !== state.imageBaseline);
        break;
      case "translator":
        state.setTranslator(session as TranslatorToolSession);
        state.setTranslatorDirty(
          hasContent && fingerprint !== state.translatorBaseline,
        );
        break;
      case "research":
        state.setResearch(session as ResearchToolSession);
        state.setResearchDirty(
          hasContent && fingerprint !== state.researchBaseline,
        );
        break;
      case "meeting":
        state.setMeeting(session as MeetingToolSession);
        state.setMeetingDirty(
          hasContent && fingerprint !== state.meetingBaseline,
        );
        break;
    }
  }, [tool, session, hasContent, fingerprint]);
}
