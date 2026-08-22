import type { RichTextBlock } from '../../types/content';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { EditableProjectBody } from './EditableProjectBody';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const uploadProjectImage = vi.fn();

vi.mock('../../lib/api', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/api')>('../../lib/api');
  return {
    ...actual,
    uploadProjectImage: (...args: unknown[]) => uploadProjectImage(...args),
  };
});

vi.mock('../../lib/auth', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/auth')>('../../lib/auth');
  return {
    ...actual,
    useAuth: () => ({
      accessToken: 'tok',
      isAdmin: true,
      user: { email: 'a@b.com', displayName: 'A' },
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      isLoading: false,
    }),
  };
});

const body: RichTextBlock[] = [
  { type: 'paragraph', text: 'Hello body' },
  { type: 'image', url: 'https://cdn.example/a.jpg', alt: 'Still' },
];

function renderEditor(
  onSave = vi.fn(),
  blocks: RichTextBlock[] = body,
) {
  return render(
    <MemoryRouter initialEntries={['/projects/x?edit=1']}>
      <AuthProvider>
        <EditModeProvider>
          <EditableProjectBody
            projectId="proj-1"
            body={blocks}
            onSave={onSave}
          />
        </EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('EditableProjectBody', () => {
  beforeEach(() => {
    uploadProjectImage.mockReset();
  });

  it('edits paragraph text on blur', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderEditor(onSave);

    const area = screen.getByLabelText('Paragraph text');
    await user.clear(area);
    await user.type(area, 'Updated copy');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith([
      { type: 'paragraph', text: 'Updated copy' },
      body[1],
    ]);
  });

  it('adds a paragraph block', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderEditor(onSave);

    await user.click(screen.getByRole('button', { name: 'Add paragraph' }));
    expect(onSave).toHaveBeenCalledWith([
      ...body,
      { type: 'paragraph', text: '' },
    ]);
  });

  it('rejects uploads over 20 MB with a clear message', async () => {
    const user = userEvent.setup();
    renderEditor(vi.fn());

    const big = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 21 * 1024 * 1024 });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, big);

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/max 20 MB/i);
    expect(uploadProjectImage).not.toHaveBeenCalled();
  });

  it('edits link CTA label and url on blur', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderEditor(onSave, [
      {
        type: 'link',
        url: 'https://example.com/watch',
        label: 'Watch Here',
      },
    ]);

    const label = screen.getByLabelText('Link button text');
    await user.clear(label);
    await user.type(label, 'Listen Here');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith([
      {
        type: 'link',
        url: 'https://example.com/watch',
        label: 'Listen Here',
      },
    ]);

    onSave.mockClear();
    const url = screen.getByLabelText('Link URL');
    await user.clear(url);
    await user.type(url, 'https://example.com/listen');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith([
      {
        type: 'link',
        url: 'https://example.com/listen',
        label: 'Listen Here',
      },
    ]);
  });

  it('migrates legacy embed blocks to link on edit', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderEditor(onSave, [
      { type: 'embed', url: 'https://youtu.be/abc' },
    ]);

    expect(screen.getByText('link (legacy embed)')).toBeInTheDocument();
    const label = screen.getByLabelText('Link button text');
    expect(label).toHaveValue('Watch Here');

    await user.clear(label);
    await user.type(label, 'Watch Now');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith([
      {
        type: 'link',
        url: 'https://youtu.be/abc',
        label: 'Watch Now',
      },
    ]);
  });

  it('adds and removes link blocks', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderEditor(onSave, [
      {
        type: 'link',
        url: 'https://example.com/a',
        label: 'Watch Here',
      },
    ]);

    await user.click(screen.getByRole('button', { name: 'Add link' }));
    expect(onSave).toHaveBeenCalledWith([
      {
        type: 'link',
        url: 'https://example.com/a',
        label: 'Watch Here',
      },
      { type: 'link', url: '', label: 'Watch Here' },
    ]);

    onSave.mockClear();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onSave).toHaveBeenCalledWith([]);
  });
});
