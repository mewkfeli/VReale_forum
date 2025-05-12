using System;
using System.Collections.Generic;

namespace AdminPanel.Model;

public partial class Thread
{
    public int Id { get; set; }

    public int BoardId { get; set; }

    public string? Subject { get; set; }

    public bool? IsPinned { get; set; }

    public bool? IsClosed { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? PostCount { get; set; }

    public virtual Board Board { get; set; } = null!;

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}
