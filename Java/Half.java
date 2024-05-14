import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JPanel;

public class myTest {

    public static void main(String[] args) {

        final JFrame frame = new JFrame();
        JPanel panel = new JPanel();

        JButton button1 = new JButton("Click me!");

        frame.add(panel);
        panel.add(button1);
        frame.setSize(300, 200); // Set the size of the frame
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // Close operation
        frame.setVisible(true);

        button1.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent arg0) {
                JOptionPane.showMessageDialog(frame, "Hello World");
            }
        });
    }
}
