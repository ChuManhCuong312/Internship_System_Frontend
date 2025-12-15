import { useState } from "react"
import "./create-event-modal.css"
import { toast } from "react-toastify"

export default function EventModal({ event, onClose, onUpdate, onDelete }) {
  if (!event) return null
  const { isPast } = event

  const [isEdit, setIsEdit] = useState(false)

  const [form, setForm] = useState({
    title: event.title,
    location: event.location,
    eventDate: formatLocalDate(event.date),
    startTime: event.startTime.slice(0, 5),
    endTime: event.endTime.slice(0, 5),
    description: event.description,
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    if (!form.location.trim()) {
        toast.error("Địa chỉ không được để trống")
        return
      }
    onUpdate(event.id, {
      ...form,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
    })
  }

  return (
    <div className="cem-overlay" onClick={onClose}>
      <div className="cem-modal" onClick={(e) => e.stopPropagation()}>

        <h2 className="cem-title">
          {isEdit ? "Chỉnh sửa sự kiện" : event.title}
        </h2>

        {isEdit ? (
          <div className="cem-form">
            <input
              className="cem-input"
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            <div className="cem-time">
              <input
                className="cem-input"
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
              <span>→</span>
              <input
                className="cem-input"
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>

            <input
              className="cem-input"
              name="location"
              value={form.location}
              onChange={handleChange}
            />

            <textarea
              className="cem-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="cem-form">
            <p>📅 {event.date.toLocaleDateString("vi-VN")}</p>
            <p>⏰ {event.startTime.slice(0, 5)} – {event.endTime.slice(0, 5)}</p>
            <p>📍 {event.location || "Không có địa điểm"}</p>
            {event.description && <p>{event.description}</p>}
          </div>
        )}

        <div className="cem-actions">
          {isEdit ? (
            <>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={isPast}
              >
                Lưu
              </button>

              <button className="btn-cancel" onClick={() => setIsEdit(false)}>
                Hủy
              </button>
            </>
          ) : (
            <>
              {!isPast && (
                <button className="btn-primary" onClick={() => setIsEdit(true)}>
                  Chỉnh sửa
                </button>
              )}

              {!isPast && (
                <button className="btn-danger" onClick={() => onDelete(event.id)}>
                  Xóa
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const formatLocalDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}
