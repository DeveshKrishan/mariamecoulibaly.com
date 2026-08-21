package api

import (
	"errors"
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/auth"
)

func (s *Server) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if s.auth == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{
				"error": "admin auth is not configured",
			})
			return
		}

		user, err := s.auth.Authenticate(r.Context(), auth.BearerToken(r))
		if errors.Is(err, auth.ErrForbidden) {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
			return
		}

		next.ServeHTTP(w, r.WithContext(auth.WithUser(r.Context(), user)))
	})
}

func (s *Server) handleAdminMe(w http.ResponseWriter, r *http.Request) {
	user := auth.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"email":       user.Email,
		"displayName": user.DisplayName,
	})
}
