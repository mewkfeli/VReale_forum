using System;
using System.Collections.Generic;

namespace AdminPanel.Model;

public partial class Moderator
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Role { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public string Password { get; set; } = null!;
}
