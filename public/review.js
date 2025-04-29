$(document).ready(function() {
    $("#reviewForm").submit(function(event) {
        event.preventDefault();
        
        var company = $("#company").val();
        var job = $("#job").val();
        var salary = $("#salary").val();
        var rating = $("#rating").val();
        var reviewText = $("#review").val();
        var date = new Date().toISOString().split('T')[0];
  
        var newReview = {
            company: company,
            job: job,
            salary: salary,
            rating: rating,
            review: reviewText,
            date: date
        };
  
        // Dynamically append new review without refreshing
        var reviewHtml = `
            <div class="review">
                <h3>${newReview.company} - ${newReview.job}</h3>
                <p><strong>Rating:</strong> ${newReview.rating}/5</p>
                ${newReview.salary ? `<p><strong>Salary:</strong> $${newReview.salary}</p>` : ''}
                <p>${newReview.review}</p>
                <p><em>Posted on ${newReview.date}</em></p>
            </div>
        `;
        
        $("#reviewsContainer").append(reviewHtml);
        $("#reviewForm")[0].reset();
    });
  });
  