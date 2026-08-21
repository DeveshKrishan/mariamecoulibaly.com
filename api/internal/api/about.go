package api

import (
	"errors"
	"log"
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

func (s *Server) handleGetAboutPage(w http.ResponseWriter, r *http.Request) {
	page, err := s.store.GetAboutPage(r.Context())
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "about page not found"})
		return
	}
	if err != nil {
		log.Printf("get about page: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, page)
}
