package httputil

import (
	"encoding/json"
	"net/http"
)

type InvalidParam struct {
	Name   string `json:"name"`
	Reason string `json:"reason"`
}

type ProblemDetails struct {
	Type          string         `json:"type"`
	Title         string         `json:"title"`
	Status        int            `json:"status"`
	Detail        string         `json:"detail,omitempty"`
	Instance      string         `json:"instance,omitempty"`
	Code          string         `json:"code,omitempty"`
	InvalidParams []InvalidParam `json:"invalid_params,omitempty"`
}

func WriteProblem(w http.ResponseWriter, status int, problem ProblemDetails) {
	if problem.Type == "" {
		problem.Type = "about:blank"
	}
	problem.Status = status

	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(problem)
}
