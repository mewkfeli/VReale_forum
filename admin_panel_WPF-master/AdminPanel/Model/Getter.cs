using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdminPanel.Model
{
    internal class Getter
    {
        public BdContext db;
        public Getter()
        {
            db = new BdContext();
        }
        public List<Moderator> GetModerators()
        {
            return db.Moderators.ToList();
        }
        public List<Post> GetPosts()
        {
            return db.Posts.ToList();
        }
    }
}
