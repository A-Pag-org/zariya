import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { ACTIONS, Can } from "../../../core/authz";
import { formatDateTime } from "../lib/formatters";
import { useAddCommentMutation, useDonorCommentsQuery } from "../hooks/useDonors";

export function DonorComments({ donorId }) {
  const { user } = useAuth();
  const { data: comments = [] } = useDonorCommentsQuery(donorId);
  const addComment = useAddCommentMutation(donorId);
  const [draft, setDraft] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    await addComment.mutateAsync({ author: user.name, body });
    setDraft("");
  }

  return (
    <Box>
      <Typography variant="overline" component="h3">
        Comments
      </Typography>

      <Stack spacing={2} sx={{ mt: 1.5 }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{ borderLeft: 2, borderColor: "secondary.main", pl: 2, py: 0.25 }}
            >
              <Typography variant="body2">{comment.body}</Typography>
              <Typography variant="caption" color="text.secondary">
                {comment.author} · {formatDateTime(comment.createdAt)}
              </Typography>
            </Box>
          ))
        )}
      </Stack>

      <Can action={ACTIONS.COMMENT} module="donor-management">
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder="Add a comment for the finance and fundraising teams…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ mt: 1.5 }}
            disabled={!draft.trim() || addComment.isPending}
          >
            {addComment.isPending ? "Posting…" : "Post comment"}
          </Button>
        </Box>
      </Can>
    </Box>
  );
}
