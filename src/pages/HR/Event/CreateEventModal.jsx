import { useState } from "react"
import "./create-event-modal.css"
import { toast } from "react-toastify"


export default function CreateEventModal({ date, onClose, onSubmit }) {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const formattedDate = date
      ? date.toLocaleDateString("vi-VN")
      : ""
  const handleSubmit = () => {
    if (!title || !startTime || !endTime|| !location.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (!isEndTimeAfterStartTime(startTime, endTime)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu")
      return
    }

    onSubmit({
      title,
      location,
      eventDate: formatLocalDate(date),
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      description,
    })
  }
const formatLocalDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
  const isEndTimeAfterStartTime = (start, end) => {
    return start && end && start < end
  }

  return (
    <div className="cem-overlay" onClick={onClose}>
      <div className="cem-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="cem-title">Tạo sự kiện</h2>

        <div className="cem-form">

          <div className="cem-date">
            <input
              className="cem-input"
              value={formattedDate}
              disabled
            />
          </div>
          <input
            className="cem-input"
            placeholder="Tên sự kiện"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="cem-time">
            <input
              className="cem-input"
              type="time"
              value={startTime}
              onChange={(e) => {
                  setStartTime(e.target.value)
                  e.target.blur()
                }}
            />
            <span>→</span>
            <input
              className="cem-input"
              type="time"
              value={endTime}
              onChange={(e) => {
                  setEndTime(e.target.value)
                  e.target.blur()
                }}
            />
          </div>

          <input
            className="cem-input"
            placeholder="Địa điểm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <textarea
            className="cem-textarea"
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="cem-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Tạo
          </button>
        </div>
      </div>
    </div>
  )
}