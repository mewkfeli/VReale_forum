using System;
using System.Collections.Generic;

namespace AdminPanel.Model;

public partial class Post
{
    public int Id { get; set; }

    public int ThreadId { get; set; }

    public int? ParentId { get; set; }

    public bool? IsOp { get; set; }

    public string? Name { get; set; }

    public string? Subject { get; set; }

    public string Message { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<Post> InverseParent { get; set; } = new List<Post>();

    public virtual Post? Parent { get; set; }

    public virtual Thread Thread { get; set; } = null!;
}
