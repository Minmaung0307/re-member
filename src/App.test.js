import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
jest.mock(
  "./FamilyVault",
  () =>
    function ReMemberFixture() {
      return <h1>Re-Member application</h1>;
    },
);
test("root is dedicated to Re-Member", () => {
  window.history.replaceState({}, "", "/");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Re-Member application" }),
  ).toBeInTheDocument();
});
test("legacy family links still resolve to Re-Member", () => {
  window.history.replaceState({}, "", "/family/");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Re-Member application" }),
  ).toBeInTheDocument();
});
