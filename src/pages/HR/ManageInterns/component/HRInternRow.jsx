import React from "react";

const HRInternRow = ({ intern, index, translateStatus }) => {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{intern.fullName}</td>
      <td>{intern.email}</td>
      <td>{intern.phone}</td>
      <td>{intern.major}</td>
      <td>{intern.school}</td>
      <td>{intern.gpa}</td>
      <td>
        {intern.cvPath && (
          <a href={`/${intern.cvPath}`} download>
            {intern.cvPath}
          </a>
        )}
        {intern.internshipApplicationPath && (
          <>
            {" | "}
            <a href={`/${intern.internshipApplicationPath}`} download>
              {intern.internshipApplicationPath}
            </a>
          </>
        )}
        {!intern.cvPath && !intern.internshipApplicationPath && "Chưa có"}
      </td>
      <td>{translateStatus(intern.status)}</td>
    </tr>
  );
};

export default HRInternRow;
