package api

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

const maxImageBytes = 20 << 20 // 20 MiB

var allowedImageTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

type uploadURLBody struct {
	ProjectID   string `json:"projectId"`
	ContentType string `json:"contentType"`
	ByteSize    int64  `json:"byteSize"`
}

type uploadURLResponse struct {
	UploadURL string `json:"uploadUrl"`
	PublicURL string `json:"publicUrl"`
	ObjectKey string `json:"objectKey"`
}

func (s *Server) handleMediaUploadURL(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireActor(w, r); !ok {
		return
	}
	if s.media == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"error": "media storage not configured (set API_SUPABASE_SERVICE_ROLE_KEY)",
		})
		return
	}

	var body uploadURLBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	projectID := strings.TrimSpace(body.ProjectID)
	if projectID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "projectId is required"})
		return
	}
	contentType := strings.ToLower(strings.TrimSpace(body.ContentType))
	ext, ok := allowedImageTypes[contentType]
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "contentType must be image/jpeg, image/png, or image/webp",
		})
		return
	}
	if body.ByteSize <= 0 || body.ByteSize > maxImageBytes {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "byteSize must be between 1 and 20971520",
		})
		return
	}

	if _, err := s.findAdminProjectByID(r, projectID); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
			return
		}
		log.Printf("media upload-url lookup: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}

	objectKey := fmt.Sprintf("projects/%s/%s.%s", projectID, newObjectID(), ext)
	uploadURL, err := s.media.CreateSignedUploadURL(r.Context(), objectKey)
	if err != nil {
		log.Printf("media sign upload: %v", err)
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "failed to create upload url"})
		return
	}

	writeJSON(w, http.StatusOK, uploadURLResponse{
		UploadURL: uploadURL,
		PublicURL: s.media.PublicURL(objectKey),
		ObjectKey: objectKey,
	})
}

func (s *Server) findAdminProjectByID(r *http.Request, projectID string) (*models.Project, error) {
	projects, err := s.store.ListAdminProjects(r.Context())
	if err != nil {
		return nil, err
	}
	for i := range projects {
		if projects[i].ID == projectID {
			p := projects[i]
			return &p, nil
		}
	}
	return nil, store.ErrNotFound
}

func (s *Server) cleanupReplacedThumbnail(r *http.Request, actor store.Actor, projectID, oldURL, newURL string) {
	if oldURL == "" || oldURL == newURL {
		return
	}
	payload, _ := json.Marshal(map[string]any{
		"projectId": projectID,
		"oldUrl":    oldURL,
		"newUrl":    newURL,
	})
	if err := s.store.LogAudit(r.Context(), actor, "media.replace", payload); err != nil {
		log.Printf("audit media.replace: %v", err)
	}
	if s.media == nil {
		return
	}
	key, ok := s.media.ObjectKeyFromPublicURL(oldURL)
	if !ok {
		return
	}
	if err := s.media.DeleteObjectBestEffort(r.Context(), key); err != nil {
		log.Printf("media delete old object %q: %v", key, err)
	}
}

func newObjectID() string {
	var b [16]byte
	_, _ = rand.Read(b[:])
	// UUID v4-ish formatting.
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
