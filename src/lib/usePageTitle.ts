import { useEffect } from "react";

const SITE_NAME = "VCE AI Tutor";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - ${SITE_NAME}`;
  }, [title]);
}
