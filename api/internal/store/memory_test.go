package store

import (
	"context"
	"errors"
	"testing"
)

func TestMemoryListProjects(t *testing.T) {
	s := NewMemory()
	projects, err := s.ListProjects(context.Background())
	if err != nil {
		t.Fatalf("ListProjects() error = %v", err)
	}
	if len(projects) != len(stubProjects) {
		t.Fatalf("len(projects) = %d, want %d", len(projects), len(stubProjects))
	}
	if projects[0].Slug != "residenthome" {
		t.Errorf("first slug = %q, want residenthome", projects[0].Slug)
	}
}

func TestMemoryGetProjectBySlug(t *testing.T) {
	s := NewMemory()
	project, err := s.GetProjectBySlug(context.Background(), "udacity")
	if err != nil {
		t.Fatalf("GetProjectBySlug() error = %v", err)
	}
	if project.Title != "Udacity Accenture" {
		t.Errorf("Title = %q, want Udacity Accenture", project.Title)
	}

	_, err = s.GetProjectBySlug(context.Background(), "missing-slug")
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("GetProjectBySlug(missing) error = %v, want ErrNotFound", err)
	}
}

func TestMemoryGetAboutPage(t *testing.T) {
	s := NewMemory()
	page, err := s.GetAboutPage(context.Background())
	if err != nil {
		t.Fatalf("GetAboutPage() error = %v", err)
	}
	if page.Title != "About Me" {
		t.Errorf("Title = %q, want About Me", page.Title)
	}
	if len(page.Links) < 2 {
		t.Errorf("len(Links) = %d, want >= 2", len(page.Links))
	}
}
