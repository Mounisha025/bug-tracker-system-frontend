import {
  createContext,
  useEffect,
  useState,
  useContext,
} from "react";

import bugService from "../services/bugService";
import { AuthContext } from "./AuthContext";

export const BugContext =
  createContext();

const BugProvider = ({
  children,
}) => {

  const { user } = useContext(AuthContext);

  const [bugs, setBugs] =
    useState([]);

  const fetchBugs =
    async () => {

      try {
        const data = await bugService.getBugs();
        setBugs(data);
      } catch (error) {
        console.error("Failed to fetch bugs:", error);
      }
    };

  useEffect(() => {
    if (user) {
      fetchBugs();
    }
  }, [user]);

  const updateBugStatus = async (
    bugId,
    newStatus
  ) => {

    try {
      const bug = bugs.find((b) => b.id === bugId);
      if (!bug) return;

      await bugService.updateBug(bugId, {
        ...bug,
        status: newStatus,
      });

      fetchBugs();
    } catch (error) {
      console.error("Failed to update bug status:", error);
    }
  };

  return (

    <BugContext.Provider
      value={{
  bugs,
  setBugs,
  fetchBugs,
  updateBugStatus,
}}
    >

      {children}

    </BugContext.Provider>
  );
};

export default BugProvider;