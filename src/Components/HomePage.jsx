import { useState } from "react"
import axios from "axios"
import "./HomePage.css"

const platforms = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter" },
]
const YOUR_GOOGLE_API_KEY=import.meta.env.SM_KEY

export const HomePage = () => {
  const [formData, setFormData] = useState({
    text: "",
    platform: [],
  })
  const [geminiResponse, setGeminiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTextChange = (event) => {
    setFormData({ ...formData, text: event.target.value })
  }

  const handlePlatformToggle = (event) => {
    const value = event.target.value
    const checked = event.target.checked

    setFormData((current) => ({
      ...current,
      platform: checked
        ? [...current.platform, value]
        : current.platform.filter((item) => item !== value),
    }))
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setGeminiResponse("")

    if (!formData.text.trim()) {
      setError("Please enter a topic or text prompt.")
      return
    }

    if (formData.platform.length === 0) {
      setError("Please choose at least one platform.")
      return
    }

    setIsLoading(true)
    try {
      const options = {
        method: "POST",
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        headers: {
          "content-type": "application/json",
          "X-goog-api-key": YOUR_GOOGLE_API_KEY,
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: `Create social media posts for ${formData.platform.join(", ")} using the topic: ${formData.text}. Output structure: platform:[platform], content:[postContent]`,
                },
              ],
            },
          ],
        },
      }

      const { data } = await axios.request(options)
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response returned."
      setGeminiResponse(content)
    } catch (err) {
      console.error(err)
      setError("Failed to generate content. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="homepage-page">
      <section className="homepage-card">
        <header className="homepage-hero">
          <h1 className="homepage-title">Social Media Post Generator</h1>
          <p className="homepage-subtitle">
            Write a prompt, choose the networks you want to publish to, and let the AI generate polished post content for each platform.
          </p>
        </header>

        <div className="homepage-body">
          <form className="homepage-form" onSubmit={handleFormSubmit}>
            <div className="form-section">
              <label htmlFor="post-prompt">Tell us what your post should be about</label>
              <textarea
                id="post-prompt"
                className="homepage-textarea"
                placeholder="Type your topic, product, promotion, or idea here..."
                value={formData.text}
                onChange={handleTextChange}
              />
            </div>

            <div className="form-section">
              <label>Choose platforms</label>
              <div className="platform-grid">
                {platforms.map((platform) => (
                  <label key={platform.value} className="platform-option">
                    <input
                      type="checkbox"
                      value={platform.value}
                      checked={formData.platform.includes(platform.value)}
                      onChange={handlePlatformToggle}
                    />
                    {platform.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="submit-row">
              <button className="submit-button" type="submit" disabled={isLoading}>
                {isLoading ? "Generating…" : "Generate Posts"}
              </button>

            </div>

            {error && <p className="helper-text" style={{ color: "#fda4af" }}>{error}</p>}
          </form>

          <section className="result-panel">
            <div className="result-meta">
              <span>Selected platforms: {formData.platform.length > 0 ? formData.platform.join(", ") : "None"}</span>
              <span>{formData.text ? `Prompt length: ${formData.text.length} chars` : "Enter a prompt to begin."}</span>
            </div>
            <h2>Generated post preview</h2>
            <div className="result-output">
              {geminiResponse && geminiResponse }
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
