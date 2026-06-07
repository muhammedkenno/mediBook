import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Emergency</Badge>)
    expect(screen.getByText("Emergency")).toBeInTheDocument()
  })

  it("applies the destructive variant styles", () => {
    render(<Badge variant="destructive">Urgent</Badge>)
    expect(screen.getByText("Urgent").className).toContain("bg-destructive")
  })
})
