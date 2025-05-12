using System;
using System.Collections.Generic;

namespace AdminPanel.Model;

public partial class Board
{
    public int Id { get; set; }

    public string ShortName { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsHidden { get; set; }

    public virtual ICollection<Thread> Threads { get; set; } = new List<Thread>();
}
