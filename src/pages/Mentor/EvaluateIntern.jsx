import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";
import Page from "./evaluation/page"

const MentorEvaluations = () => {
  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
          <Page />
      </div>
    </div>
  );
};

export default MentorEvaluations;