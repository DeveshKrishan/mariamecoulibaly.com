package store

import (
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func TestFormatPublishedAt(t *testing.T) {
	ts := pgtype.Timestamptz{Time: time.Date(2026, 7, 22, 0, 0, 0, 0, time.UTC), Valid: true}
	if got := formatPublishedAt(ts); got != "2026-07-22" {
		t.Errorf("formatPublishedAt = %q, want 2026-07-22", got)
	}
	if got := formatPublishedAt(pgtype.Timestamptz{}); got != "" {
		t.Errorf("formatPublishedAt(invalid) = %q, want empty", got)
	}
}

func TestParsePublishedAt(t *testing.T) {
	ts, err := parsePublishedAt("2026-07-22")
	if err != nil {
		t.Fatalf("parsePublishedAt() error = %v", err)
	}
	if !ts.Valid || ts.Time.Format("2006-01-02") != "2026-07-22" {
		t.Errorf("parsed = %+v", ts)
	}
	empty, err := parsePublishedAt("")
	if err != nil || empty.Valid {
		t.Fatalf("parsePublishedAt(\"\") = %+v, err=%v", empty, err)
	}

	iso, err := parsePublishedAt("2026-08-21T20:30:51.936Z")
	if err != nil {
		t.Fatalf("parsePublishedAt(RFC3339Nano) error = %v", err)
	}
	if !iso.Valid || iso.Time.Format("2006-01-02") != "2026-08-21" {
		t.Errorf("parsed ISO = %+v", iso)
	}
}

func TestUUIDString(t *testing.T) {
	var id pgtype.UUID
	id.Valid = true
	id.Bytes = [16]byte{
		0x55, 0x0e, 0x84, 0x00,
		0xe2, 0x9b,
		0x41, 0xd4,
		0xa7, 0x16,
		0x44, 0x66, 0x55, 0x44, 0x00, 0x00,
	}

	got := uuidString(id)
	want := "550e8400-e29b-41d4-a716-446655440000"
	if got != want {
		t.Errorf("uuidString = %q, want %q", got, want)
	}
	if uuidString(pgtype.UUID{}) != "" {
		t.Error("expected empty string for invalid UUID")
	}
}
