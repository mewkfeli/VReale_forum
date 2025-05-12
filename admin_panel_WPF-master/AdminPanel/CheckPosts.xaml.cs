using AdminPanel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Wpf.Ui.Controls;
using TextBlock = Wpf.Ui.Controls.TextBlock;

namespace AdminPanel
{
    /// <summary>
    /// Логика взаимодействия для CheckPosts.xaml
    /// </summary>
    public partial class CheckPosts : FluentWindow
    {
        Getter getter = new Getter();
        public CheckPosts()
        {
            InitializeComponent();
            upload_data();
        }
        public void upload_data()
        {
            foreach (var item in getter.GetPosts())
            {
                if (item.Status != "onquerry" || item.IsOp == false)
                {
                    continue;
                }
                approve_post_user_control approve_Post_User_Control = new approve_post_user_control();
                approve_Post_User_Control.set_data(item.Subject, item.Message, item.Name, item.Id);
                stackPanel.Children.Add(approve_Post_User_Control);
                stackPanel.Children.Add(new TextBlock());
                
            }
        }
    }
}
