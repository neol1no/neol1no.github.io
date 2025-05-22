// Comment form functionality disabled
/*
document.getElementById('commentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const commentsList = document.getElementById('commentsList');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    
    newComment.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${name}</span>
            <span class="comment-date">${date}</span>
        </div>
        <p>${comment}</p>
    `;
    
    commentsList.insertBefore(newComment, commentsList.firstChild);
    
    document.getElementById('name').value = '';
    document.getElementById('comment').value = '';
});
*/ 