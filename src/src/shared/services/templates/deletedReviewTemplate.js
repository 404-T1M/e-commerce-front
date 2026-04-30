const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

exports.deletedReviewTemplate = (
  userName,
  reviewRating,
  reviewComment,
  reason,
) => {
  const safeUserName = escapeHtml(userName);
  const normalizedReviewRating = Number(reviewRating);
  const safeReviewRating = Number.isFinite(normalizedReviewRating)
    ? normalizedReviewRating
    : "N/A";
  const ratingText = Number.isFinite(normalizedReviewRating)
    ? `${safeReviewRating}/5`
    : "N/A";
  const safeReviewComment = escapeHtml(reviewComment);
  const safeReason = escapeHtml(reason);

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${safeUserName},</h2>
          <p>Your review has been removed by our moderation team.</p>

          <h3>Your original review:</h3>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; color: #555;">
            <p><strong>Rating:</strong> ${ratingText}</p>
            <p><strong>Comment:</strong> ${safeReviewComment}</p>
          </blockquote>

          <h3>Reason for removal:</h3>
          <p style="color: #d32f2f;">${safeReason}</p>

          <p>If you have any questions, please contact our support team.</p>
        </div>
        `;
};
